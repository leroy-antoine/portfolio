/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** handle_signals
*/

#include <stdbool.h>
#include <signal.h>
#include "mysh.h"

void handle_signal(int __attribute_maybe_unused__ sig)
{
    check_signal_t *signals = is_signal();

    signals->is_ctrl_z = true;
}
