/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** is_ctrl_d.c
*/

#include <stdbool.h>
#include "mysh.h"

bool is_ctrl_d(char c)
{
    return c == CTRLD;
}
