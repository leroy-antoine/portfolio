/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell2-ariel.amriou
** File description:
** exec_command_no_fork.c
*/

#include <stdlib.h>
#include <string.h>
#include "my.h"
#include "mysh.h"

static bool check_jobs(char *command, system_t *sys, char **line)
{
    for (int j = 0; func[j].key[0] != '\0'; j++) {
        if (strcmp(command, func[j].key) == EPI_SUCCESS) {
            func[j].func(sys, line);
            return true;
        }
    }
    return false;
}

void exec_command_no_fork(char **args, system_t *sys,
    char **path, char **env_list)
{
    int len = my_list_len(args);

    for (int i = 0; i < len; i++) {
        if (check_jobs(args[i], sys, args))
            exit(EPI_SUCCESS);
    }
    for (size_t i = 0; i < ARRAY_SIZE(commands); i++)
        if (strcmp(commands[i].command, args[0]) == 0) {
            commands[i].exec(args, sys);
            exit(EPI_SUCCESS);
        }
    command(args, sys, path, env_list);
}
