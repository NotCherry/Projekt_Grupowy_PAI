import os
from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = 8000
ROOT = "."

if ROOT != ".":
    os.chdir(ROOT)

def run():
    httpd = HTTPServer(("", PORT), SimpleHTTPRequestHandler)
    print(f"\n{'='*50}")
    print(f"{'='*50}")
    print(f"\n Kliknij tutaj: http://localhost:{PORT}/")
    print(f"\n Aby zatrzymać serwer, naciśnij CTRL+C\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n Serwer zatrzymany.")
        httpd.shutdown()

if __name__ == "__main__":
    run()
