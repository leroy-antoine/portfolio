/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** create_handler
*/

#include <signal.h>
#include "mysh.h"

struct sigaction create_handler(void (*handler)(int sig))
{
    struct sigaction handle_signals = {0};

    handle_signals.sa_handler = handler;
    handle_signals.sa_flags = SA_RESTART;
    return handle_signals;
}
