import http.server
import socketserver

PORT = 8000
HOST = "127.0.0.1"

Obsluga = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer((HOST, PORT), Obsluga) as serwer_http:
    print(f"Serwer działa na http://localhost:{PORT}")
    print(f"Naciśnij Ctrl+C aby zatrzymać serwer")
    serwer_http.serve_forever()