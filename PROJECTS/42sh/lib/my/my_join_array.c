/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-loan.riyanto
** File description:
** my_join_array
*/

#include <stddef.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "my.h"

static int copy_string(char *dest, char const *src)
{
    int count = 0;

    for (int i = 0; src[i] != '\0'; i++){
        dest[i] = src[i];
        count++;
    }
    dest[count] = '\0';
    return count;
}

static int get_str_len(char **array, char *separator)
{
    int separator_len = strlen(separator);
    int str_len = 0;

    for (int i = 0; array[i] != NULL; i++){
        str_len += strlen(array[i]) + separator_len;
    }
    return str_len - separator_len;
}

static void fill_string(char *str, char **array, char *separator, int str_len)
{
    int j = 0;

    for (int i = 0; array[i] != NULL; i++){
        j += (copy_string(&str[j], array[i]));
        if (array[i + 1] != NULL){
            j += (copy_string(&str[j], separator));
        }
    }
    str[str_len] = '\0';
}

char *my_join_array(char **array, char *separator)
{
    int str_len = 0;
    char *str = NULL;

    if (array == NULL || separator == NULL)
        return NULL;
    str_len = get_str_len(array, separator);
    str = malloc(sizeof(char) * (str_len + 1));
    if (str == NULL)
        return NULL;
    fill_string(str, array, separator, str_len);
    return str;
}
