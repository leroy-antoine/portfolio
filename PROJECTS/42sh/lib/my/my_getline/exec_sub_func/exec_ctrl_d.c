/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** exec_ctrl_d.c
*/

#include <string.h>
#include <unistd.h>
#include <stdio.h>
#include <termios.h>
#include "formatsh.h"
#include "mysh.h"


void exec_ctrl_d(index_t *ind)
{
    for (int i = 0; i < ind->len; i++)
        dprintf(STDOUT_FILENO, "\b \b");
    if (tcsetattr(1, TCSANOW, &ind->old) != SUCCESS)
        return;
    ind->buf = realloc(ind->buf, 2);
    if (ind->buf == NULL)
        return;
    ind->buf[0] = '\0';
    strcat(ind->buf, "\n\0");
    ind->exit = EOT;
    return;
}
