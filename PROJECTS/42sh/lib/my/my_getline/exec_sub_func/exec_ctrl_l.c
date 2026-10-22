/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** exec_ctrl_l.c
*/

#include <stdio.h>
#include <unistd.h>
#include "formatsh.h"
#include "mysh.h"

void exec_ctrl_l(index_t __attribute_maybe_unused__ *ind)
{
    dprintf(STDOUT_FILENO, "%s", str_term_caps[CLEAR]);
}
