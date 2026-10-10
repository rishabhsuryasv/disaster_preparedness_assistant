"""Tiny local helper (Python standard library only - nothing to install).

Serves the app on http://localhost:8000 and exposes /api/alerts, which fetches the
official NDMA SACHET alert feed server-side (browsers cannot read it directly
because SACHET does not send CORS headers). Results are cached for 60 seconds.
"""
import http.server
import json
import os
import socket
import socketserver
import threading
import time
import urllib.request
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
SACHET = "https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails"
cache = {"t": 0, "body": b"[]"}


def fetch_alerts():
    if time.time() - cache["t"] < 60:
        return cache["body"]
    req = urllib.request.Request(SACHET, headers={"User-Agent": "DisasterPrepAssistant/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        body = r.read()
    json.loads(body)  # validate before caching
    cache.update(t=time.time(), body=body)
    return body


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api/alerts":
            try:
                body, code = fetch_alerts(), 200
            except Exception as e:  # network down, SACHET down, bad JSON
                body, code = json.dumps({"error": str(e)}).encode(), 502
            self.send_response(code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        if path in ("/", "/index.html"):
            self.path = "/DisasterPrepAssistant.html"
        super().do_GET()

    def log_message(self, *a):
        pass


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    port = 8000
    while True:
        try:
            srv = Server(("0.0.0.0", port), Handler)
            break
        except OSError:
            port += 1
            if port > 8020:
                raise
    try:
        lan = socket.gethostbyname(socket.gethostname())
    except OSError:
        lan = "your-pc-ip"
    print("\n  Disaster Preparedness Assistant is running (live NDMA SACHET alerts ON)")
    print("  Open:  http://localhost:%d" % port)
    print("  Phone on same Wi-Fi (alerts only; GPS needs https):  http://%s:%d" % (lan, port))
    print("  Close this window to stop.\n")
    threading.Timer(1.0, lambda: webbrowser.open("http://localhost:%d" % port)).start()
    srv.serve_forever()


if __name__ == "__main__":
    main()
