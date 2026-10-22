/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** move_right.c
*/

#include "formatsh.h"
#include "mysh.h"
#include <unistd.h>


int move_right(index_t *ind)
{
    if (ind->buf[ind->index] == '\0')
        return SUCCESS;
    write(1, MOVE_RIGHT, 3);
    ind->index++;
    return SUCCESS;
}
