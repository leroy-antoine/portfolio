/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** my_free.c
*/

#include <unistd.h>
#include <stdarg.h>
#include <stdlib.h>
#include "my.h"

int my_free(int return_value, int fd, const char *error_message, ...)
{
    va_list args = {0};
    void **pointer = NULL;

    if (error_message != NULL)
        dprintf(fd, "%s", error_message);
    va_start(args, error_message);
    pointer = va_arg(args, void **);
    while (pointer != NULL) {
        free(*pointer);
        *pointer = NULL;
        pointer = va_arg(args, void **);
    }
    va_end(args);
    return return_value;
}
