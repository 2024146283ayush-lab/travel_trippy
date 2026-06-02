import http.server
import json
import urllib.parse
import sys
import os
from db import init_db, save_conversation, load_conversations

PORT = 8000

class TravelTrippyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # API Routes
        if self.path == '/api/conversations':
            try:
                history = load_conversations()
                response_data = json.dumps({'status': 'success', 'history': history}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', len(response_data))
                self.end_headers()
                self.wfile.write(response_data)
            except Exception as e:
                self.send_error_response(500, str(e))
        else:
            # Fallback to serving static files from current directory
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/conversations':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                prompt = data.get('prompt')
                response = data.get('response')
                
                if not prompt or not response:
                    self.send_error_response(400, "Missing 'prompt' or 'response' in request body.")
                    return
                
                row_id = save_conversation(prompt, response)
                
                response_data = json.dumps({
                    'status': 'success', 
                    'message': 'Conversation saved successfully',
                    'id': row_id
                }).encode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', len(response_data))
                self.end_headers()
                self.wfile.write(response_data)
            except Exception as e:
                self.send_error_response(500, str(e))
        else:
            self.send_error_response(404, "API route not found.")

    def send_error_response(self, code, message):
        response_data = json.dumps({'status': 'error', 'message': message}).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(response_data))
        self.end_headers()
        self.wfile.write(response_data)

def run():
    # Initialize the database
    init_db()
    
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, TravelTrippyRequestHandler)
    print(f"Starting TravelTrippy Server on http://localhost:{PORT} ...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
        httpd.server_close()
        sys.exit(0)

if __name__ == '__main__':
    run()
