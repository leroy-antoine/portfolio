/*
** EPITECH PROJECT, 2025
** test
** File description:
** strcat_inf.c
*/

#include <stdarg.h>
#include <stdlib.h>
#include <string.h>
#include "my.h"

static int count_total_len(int count, va_list *args)
{
    va_list args_dup = {0};
    char *buff = NULL;
    int len = 0;

    va_copy(args_dup, *args);
    buff = va_arg(args_dup, char *);
    for (int i = 1; i < count; i++) {
        if (buff != NULL)
            len += strlen(buff);
        buff = va_arg(args_dup, char *);
    }
    va_end(args_dup);
    return len;
}

char *my_strcat_inf(int count, char *str, ...)
{
    int total_len = 0;
    va_list args = {0};
    char *final = NULL;
    char *tmp = NULL;

    if (str == NULL || count == 0)
        return NULL;
    va_start(args, str);
    total_len = count_total_len(count, &args) + strlen(str);
    final = malloc(total_len + 1);
    if (final == NULL)
        return NULL;
    strcpy(final, str);
    tmp = va_arg(args, char *);
    for (int i = 1; i < count && tmp != NULL; i++) {
        strcat(final, tmp);
        tmp = va_arg(args, char *);
    }
    va_end(args);
    return final;
}
