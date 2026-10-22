/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** get_env_var.c
*/

#include <string.h>
#include <stdlib.h>
#include "mysh.h"
#include "formatsh.h"
#include "my.h"

static int check_var(char *buff, const char *var, char *save, char **value)
{
    if (buff && strcmp(buff, var) == 0) {
        buff = strtok_r(NULL, "", &save);
        if (buff != NULL)
            *value = strdup(buff);
        return SUCCESS;
    }
    return SKIP;
}

static int do_loop(node_t *node, char **value, const char *var)
{
    char *line = strdup((char *)node->data);
    char *buff = NULL;
    char *save = NULL;

    if (line == NULL)
        return ERROR;
    buff = strtok_r(line, str_management[EQUAL], &save);
    if (check_var(buff, var, save, value) == SUCCESS) {
        free(line);
        return SUCCESS;
    }
    free(line);
    return SKIP;
}

char *get_env_var(linked_list_t *env, const char *var)
{
    node_t *node = NULL;
    char *value = NULL;

    if (env == NULL || var == NULL)
        return NULL;
    node = env->head;
    while (node != NULL) {
        if (do_loop(node, &value, var) == SUCCESS)
            return value;
        node = node->next;
    }
    return NULL;
}
