/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** get_alias
*/

#include "formatsh.h"
#include "mysh.h"
#include "my.h"
#include <string.h>

static char *get_path(linked_list_t *env)
{
    char *home = get_env_var(env, str_env[HOME_VAR]);
    char *new = NULL;

    if (home == NULL)
        return NULL;
    new = malloc(sizeof(char) * (strlen(home) + strlen(str_env[MYSHRC]) + 1));
    if (new == NULL)
        return NULL;
    new = strcpy(new, home);
    new = strcat(new, str_env[MYSHRC]);
    free(home);
    return new;
}

static char *get_file(linked_list_t *env)
{
    char *path = get_path(env);
    char *buffer = NULL;

    if (path == NULL)
        return NULL;
    buffer = open_file(path);
    if (buffer == NULL) {
        myshrc_cpy(path);
        buffer = open_file(path);
        if (buffer == NULL) {
            free(path);
            return NULL;
        }
    }
    free(path);
    return buffer;
}

static void find_alias(linked_list_t *list, char *line)
{
    char *alias = NULL;
    char *cmd = NULL;

    alias = strtok(line, " ");
    if (alias == NULL)
        return;
    alias = strdup(alias);
    if (alias == NULL)
        return;
    cmd = strtok(NULL, str_management[SIMPLE_QUOTE]);
    if (cmd == NULL) {
        free(alias);
        return;
    }
    cmd = strdup(cmd);
    if (cmd == NULL) {
        free(alias);
        return;
    }
    add_alias_node(list, alias, cmd, false);
}

static void is_alias(linked_list_t *list, char **tab)
{
    for (int i = 0; tab[i] != NULL; i++) {
        if (strncmp(ALIAS_STR, tab[i], ALIAS_LEN) != 0) {
            free(tab[i]);
            continue;
        }
        find_alias(list, tab[i] + ALIAS_LEN);
        free(tab[i]);
    }
    free(tab);
}

linked_list_t *get_alias(linked_list_t *env)
{
    linked_list_t *list = initialize_linked_list();
    char **tab = NULL;
    char *buffer = NULL;

    if (list == NULL)
        return NULL;
    buffer = get_file(env);
    if (buffer == NULL)
        return list;
    tab = my_str_to_word_array(buffer, "\n", "");
    free(buffer);
    if (tab == NULL)
        return list;
    is_alias(list, tab);
    sort_linked_list(list, &sort_alias_var);
    return list;
}
