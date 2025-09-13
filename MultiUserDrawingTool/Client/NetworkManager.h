#pragma once
#include <winsock2.h>
#include <string>
#include <thread>
#include <functional>

class NetworkManager {
public:
    NetworkManager();
    ~NetworkManager();
    bool connectToServer(const std::string& ip, int port);
    void sendMessage(const std::string& msg);
    void setOnMessageReceived(std::function<void(const std::string&)> callback);
private:
    SOCKET sock;
    std::thread recvThread;
    std::function<void(const std::string&)> onMessageReceived;
    void receiveLoop();
};
