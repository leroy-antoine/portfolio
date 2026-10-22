/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** my_free_str.c
*/

#include <unistd.h>
#include <stdlib.h>

void my_free_str(char **str)
{
    free(*str);
    *str = NULL;
}
