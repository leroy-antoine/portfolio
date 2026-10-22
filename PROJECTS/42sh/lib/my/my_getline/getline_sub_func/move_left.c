/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** move_left.c
*/

#include <unistd.h>
#include "formatsh.h"
#include "mysh.h"

int move_left(index_t *ind)
{
    if (ind->index <= 0)
        return SUCCESS;
    write(1, MOVE_LEFT, 3);
    ind->index--;
    return SUCCESS;
}
