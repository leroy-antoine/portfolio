/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** do_env.c
*/


#include <stdlib.h>
#include <unistd.h>

#include "my.h"
#include "mysh.h"
#include "formatsh.h"

int do_exit(char **args, system_t *sys)
{
    int exit_code = 0;

    if (my_list_len(args) > 2) {
        dprintf(STDERR_FILENO, "%s", str_message[EXT_SYN]);
        return COMMAND_ERROR;
    }
    if (args[1] != NULL) {
        if (my_is_number(args[1]) == 0) {
            dprintf(STDERR_FILENO, "%s", str_message[EXT_SYN]);
            return COMMAND_ERROR;
        }
        exit_code = atoi(args[1]);
    }
    sys->has_exited = true;
    return exit_code;
}
