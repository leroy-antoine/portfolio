/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** is_signal
*/

#include "mysh.h"

check_signal_t *is_signal(void)
{
    static check_signal_t signals = {0};

    return &signals;
}
