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
    std::cout << "����Ű�� ����������. �����Ϸ��� 'q'�� ��������." << std::endl;

    while (true) {
        Sleep(50);
        if (GetAsyncKeyState('Q') & 0x8000 || GetAsyncKeyState('q') & 0x8000) {
            while (_kbhit()) {
                _getch();  // �Է� ���� ����
            }
            break;
        } else if (GetAsyncKeyState(VK_UP) & 0x8000) {
            std::cout << "���� ����Ű ����" << std::endl;
        } else if (GetAsyncKeyState(VK_DOWN) & 0x8000) {
            std::cout << "�Ʒ��� ����Ű ����" << std::endl;
        } else if (GetAsyncKeyState(VK_RIGHT) & 0x8000) {
            std::cout << "������ ����Ű ����" << std::endl;
        } else if (GetAsyncKeyState(VK_LEFT) & 0x8000) {
            std::cout << "���� ����Ű ����" << std::endl;
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
    std::cout << "����Ű�� ����������. �����Ϸ��� 'q'�� ��������." << std::endl;
    while (true) {
        input = getchar();
        if (input == 'q') {
            break;
        } else if (input == '\033') {
            getchar();

            // �� ��° ���� �б�
            char arrow = getchar();

            switch (arrow) {
                case 'A':
                    std::cout << "���� ����Ű" << std::endl;
                    break;
                case 'B':
                    std::cout << "�Ʒ��� ����Ű" << std::endl;
                    break;
                case 'C':
                    std::cout << "������ ����Ű" << std::endl;
                    break;
                case 'D':
                    std::cout << "���� ����Ű" << std::endl;
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
    //������� ���������� ����Ű�� ��� �Է¹޵��� ��ó�� ����.
#ifdef _WIN32
    GetWindowsKeyInput();
#else
    GetLinuxKeyInput();
#endif
    return 0;
}