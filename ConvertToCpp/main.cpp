#include <iostream>

#ifdef _WIN32
#include <conio.h>
#include <windows.h>
#else
#include <termios.h>
#include <unistd.h>

#include <cstdio>
#endif

#ifdef _WIN32

void GetWindowsKeyInput() {
    std::cout << "방향키를 눌러보세요. 종료하려면 'q'를 누르세요." << std::endl;

    while (true) {
        Sleep(50);
        if (GetAsyncKeyState('Q') & 0x8000 || GetAsyncKeyState('q') & 0x8000) {
            while (_kbhit()) {
                _getch();  // 입력 버퍼 비우기
            }
            break;
        } else if (GetAsyncKeyState(VK_UP) & 0x8000) {
            std::cout << "위쪽 방향키 눌림" << std::endl;
        } else if (GetAsyncKeyState(VK_DOWN) & 0x8000) {
            std::cout << "아래쪽 방향키 눌림" << std::endl;
        } else if (GetAsyncKeyState(VK_RIGHT) & 0x8000) {
            std::cout << "오른쪽 방향키 눌림" << std::endl;
        } else if (GetAsyncKeyState(VK_LEFT) & 0x8000) {
            std::cout << "왼쪽 방향키 눌림" << std::endl;
        }
    }
}
#else
void GetLinuxKeyInput() {
    struct termios oldSettings, newSettings;
    tcgetattr(STDIN_FILENO, &oldSettings);
    newSettings = oldSettings;
    newSettings.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &newSettings);
    char input;
    std::cout << "방향키를 눌러보세요. 종료하려면 'q'를 누르세요." << std::endl;
    while (true) {
        input = getchar();
        if (input == 'q') {
            break;
        } else if (input == '\033') {
            getchar();

            // 세 번째 문자 읽기
            char arrow = getchar();

            switch (arrow) {
                case 'A':
                    std::cout << "위쪽 방향키" << std::endl;
                    break;
                case 'B':
                    std::cout << "아래쪽 방향키" << std::endl;
                    break;
                case 'C':
                    std::cout << "오른쪽 방향키" << std::endl;
                    break;
                case 'D':
                    std::cout << "왼쪽 방향키" << std::endl;
                    break;
                default:
                    break;
            }
        }
    }
    tcsetattr(STDIN_FILENO, TCSANOW, &oldSettings);
}
#endif

int main() {
    //윈도우와 리눅스에서 방향키를 모두 입력받도록 전처리 설정.
#ifdef _WIN32
    GetWindowsKeyInput();
#else
    GetLinuxKeyInput();
#endif
    return 0;
}