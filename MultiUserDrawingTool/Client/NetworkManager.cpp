#include "NetworkManager.h"
#include <iostream>

NetworkManager::NetworkManager() : sock(INVALID_SOCKET) {
    WSADATA wsa;
    WSAStartup(MAKEWORD(2,2), &wsa);
}

NetworkManager::~NetworkManager() {
    if(sock != INVALID_SOCKET) closesocket(sock);
    WSACleanup();
}

bool NetworkManager::connectToServer(const std::string& ip, int port) {
    sock = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(port);
    serverAddr.sin_addr.s_addr = inet_addr(ip.c_str());

    if(connect(sock, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
        return false;

    recvThread = std::thread(&NetworkManager::receiveLoop, this);
    recvThread.detach();
    return true;
}

void NetworkManager::sendMessage(const std::string& msg) {
    send(sock, msg.c_str(), msg.size(), 0);
}

void NetworkManager::setOnMessageReceived(std::function<void(const std::string&)> callback) {
    onMessageReceived = callback;
}

void NetworkManager::receiveLoop() {
    char buffer[1024];
    int bytes;
    while((bytes = recv(sock, buffer, sizeof(buffer), 0)) > 0) {
        if(onMessageReceived)
            onMessageReceived(std::string(buffer, bytes));
    }
}
