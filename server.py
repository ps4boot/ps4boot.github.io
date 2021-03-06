#!/usr/bin/python

import BaseHTTPServer
import json
import SocketServer

import SimpleHTTPServer

import platform
import subprocess
import os
import sys
import string

DEVNULL = open(os.devnull, 'wb')

browserPage = '/'

class PS4Console(SimpleHTTPServer.SimpleHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        path = self.path[1:]
        path = string.replace(path, 'document/en/ps4/', '')

        self.wfile.write(open(path).read())

    def do_POST(self):
        if '/debug/log' in self.path:
            data_string = self.rfile.read(int(self.headers['Content-Length']))
            self.send_response(200)
            self.end_headers()
            print '[DEBUG] [LOG] ' + data_string

        if '/debug/bin' in self.path:
            filename = self.path.split("/")[-1]

            dataString = self.rfile.read(int(self.headers['Content-length']))
            self.send_response(200)
            self.end_headers()
            f = open('Dumps/' + filename, mode='wb')
            f.write(dataString)
            f.close()

            print '[DEBUG] Binary has been dumped to %s' % filename

        if '/debug/file' in self.path:
            filename = self.path.split("/")[-1]

            dataString = self.rfile.read(int(self.headers['Content-length']))
            self.send_response(200)
            self.end_headers()
            f = open('Dumps/Files/' + filename, mode='wb')
            f.write(dataString)
            f.close()

    def log_message(self, format, *args):
        return

if __name__ == '__main__':
    server_class = BaseHTTPServer.HTTPServer
    httpd = server_class(('0.0.0.0', 80), PS4Console)

    print("Starting fakedns.py. . .")

    #subprocess.Popen(["python", "fakedns.py", "-c", "dns.conf"], stdout=DEVNULL, stderr=DEVNULL)

    if platform.system() == 'Windows':
        os.system("cls")
    else:
        os.system("clear")

    print("Ready!\r\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

    httpd.server_close()
