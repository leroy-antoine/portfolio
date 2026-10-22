/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** create_env_var
*/

#include <string.h>
#include "mysh.h"
#include "my.h"

char *create_env_var(char *str)
{
    char *env_var = NULL;

    env_var = strdup(str);
    if (env_var == NULL)
        return NULL;
    return env_var;
}
