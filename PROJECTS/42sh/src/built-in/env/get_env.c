/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** get_env
*/

#include <stdlib.h>
#include "linked_list.h"
#include "mysh.h"
#include "my.h"

linked_list_t *get_env(char **env)
{
    linked_list_t *list = initialize_linked_list();
    char *env_var = NULL;

    if (list == NULL)
        return NULL;
    for (int i = 0; env[i] != NULL; i++){
        env_var = create_env_var(env[i]);
        if (env_var == NULL)
            return NULL;
        push_to_tail(list, env_var);
    }
    return list;
}
