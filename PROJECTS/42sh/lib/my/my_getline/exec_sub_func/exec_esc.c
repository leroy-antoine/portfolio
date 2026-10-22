/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** exec_esc.c
*/
#include <stdbool.h>
#include <unistd.h>
#include <termios.h>
#include <stdio_ext.h>
#include "mysh.h"

void exec_esc(index_t *ind)
{
    ind->esc = 1;
    return;
}
