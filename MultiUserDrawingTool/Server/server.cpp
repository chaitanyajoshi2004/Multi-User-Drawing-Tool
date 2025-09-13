#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <thread>
#include <vector>
#include <string>
#include <algorithm>
#include <mutex>

#pragma comment(lib, "ws2_32.lib")

std::vector<SOCKET> clients;
std::mutex clientsMutex;

void broadcast(const std::string& message, SOCKET sender) {
    std::lock_guard<std::mutex> lock(clientsMutex);
    for (auto client : clients) {
        if (client != sender) {
            send(client, message.c_str(), message.size(), 0);
        }
    }
}

void handleClient(SOCKET client) {
    char buffer[1024];
    while (true) {
        int bytesReceived = recv(client, buffer, sizeof(buffer), 0);
        if (bytesReceived <= 0) break;

        std::string msg(buffer, bytesReceived);
        broadcast(msg, client);
    }

    closesocket(client);

    std::lock_guard<std::mutex> lock(clientsMutex);
    clients.erase(std::remove(clients.begin(), clients.end(), client), clients.end());
}

int main() {
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

    SOCKET serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(9999);
    serverAddr.sin_addr.s_addr = INADDR_ANY;

    bind(serverSocket, (sockaddr*)&serverAddr, sizeof(serverAddr));
    listen(serverSocket, SOMAXCONN);

    std::cout << "TCP server running on port 9999\n";

    while (true) {
        SOCKET client = accept(serverSocket, nullptr, nullptr);
        {
            std::lock_guard<std::mutex> lock(clientsMutex);
            clients.push_back(client);
        }
        std::thread(handleClient, client).detach();
    }

    closesocket(serverSocket);
    WSACleanup();
    return 0;
}
