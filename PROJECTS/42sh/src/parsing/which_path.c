/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** which_path.c
*/

#include "mysh.h"
#include "my.h"
#include "formatsh.h"
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdbool.h>

char *which_path(char *command, char *paths)
{
    char **paths_list = NULL;
    char *command_path = NULL;

    if (command == NULL || paths == NULL)
        return NULL;
    paths_list = my_str_to_word_array(paths, ":\n", "");
    for (int i = 0; paths_list[i] != NULL; i++) {
        command_path = my_strcat_inf(
            3, paths_list[i], str_management[SLASH], command);
        if (is_file(command_path) == true) {
            free(paths);
            free_list(paths_list);
            return command_path;
        }
        free(command_path);
    }
    free(paths);
    free_list(paths_list);
    return NULL;
}
