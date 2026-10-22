/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** env_to_list
*/

#include <string.h>
#include "mysh.h"
#include "my.h"

static int fill_list(node_t *head, char **new_list)
{
    int i = 0;
    node_t *node = head;

    while (node != NULL){
        new_list[i] = strdup((char *)node->data);
        if (new_list[i] == NULL)
            return EPI_ERROR;
        i++;
        node = node->next;
    }
    new_list[i] = NULL;
    return EPI_SUCCESS;
}

char **env_to_list(linked_list_t *env)
{
    char **new_list = NULL;
    int new_list_size = 0;

    if (env == NULL)
        return NULL;
    new_list_size = get_list_len(env);
    new_list = malloc(sizeof(char *) * (new_list_size + 1));
    if (new_list == NULL)
        return NULL;
    if (fill_list(env->head, new_list) == EPI_ERROR)
        return NULL;
    return new_list;
}
