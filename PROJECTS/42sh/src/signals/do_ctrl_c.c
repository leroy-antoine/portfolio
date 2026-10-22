/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** do_ctrl_c
*/

#include <signal.h>
#include <stdio.h>
#include <unistd.h>

#include "mysh.h"
#include "my.h"

void do_ctrl_c(pid_t pid, int *status)
{
    *status = EPI_SUCCESS;
    dprintf(STDOUT_FILENO, "\n");
    kill(pid, SIGINT);
}
