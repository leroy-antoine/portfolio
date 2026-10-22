/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** initialize_system
*/

#include <stdio.h>
#include <string.h>
#include "mysh.h"
#include "my.h"
#include "formatsh.h"
#include "linked_list.h"

static char *get_args(linked_list_t *my_env)
{
    char *home = get_env_var(my_env, "HOME");
    home = realloc(home, strlen(str_env[MYSHRC]) + 1 + strlen(home));
    char **arr = my_str_to_word_array(open_file(strcat(home, str_env[MYSHRC])), "\n", "");

    for (int i = 0; arr[i] != NULL; i++) {
        if (arr[i][0] == '#') {
            if (strcmp(my_str_to_word_array(arr[i], " \t", "")[1], "prompt") == 0)
                return arr[i + 1];
        }
    }
    return NULL;
}


system_t *initialize_system(char **env)
{
    system_t *system = malloc(sizeof(system_t));
    linked_list_t *my_env = get_env(env);
    linked_list_t *alias = get_alias(my_env);
    history_t *history = get_history(my_env);
    linked_list_t *jobs = init_jobs();
    linked_list_t *var = initialize_linked_list();

    if (system == NULL || my_env == NULL || alias == NULL || jobs == NULL
        || history == NULL || var == NULL)
        return NULL;
    system->env = my_env;
    system->alias = alias;
    system->jobs = jobs;
    system->history = history;
    system->has_exited = false;
    system->prompt = NULL;
    system->var = var;
    system->input = NULL;
    system->user = NULL;
    system->pathshrc = get_args(my_env);
    return system;
}
