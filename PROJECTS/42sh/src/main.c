/*
** EPITECH PROJECT, 2024
** main.c
** File description:
** main function
*/

#include <stdio.h>
#include <unistd.h>

#include "mysh.h"
#include "my.h"

int main(int const argc,
    char const __attribute_maybe_unused__ **argv, char **env)
{
    system_t *system = initialize_system(env);

    if (argc != 1 || system == NULL)
        return EPI_ERROR;
    return mysh(system);
}
