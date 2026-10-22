/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** wave
*/

#include "mysh.h"
#include "formatsh.h"
#include "my.h"
#include <string.h>
#include <stdlib.h>
#include <unistd.h>

static bool is_user(char *user)
{
    char *file = open_file(str_env[PASSWD]);
    char **lines = my_str_to_word_array(file, "\n\0", "");
    char *user_line = NULL;

    if (file == NULL || lines == NULL)
        return false;
    free(file);
    for (int i = 0; lines[i] != NULL; i++) {
        user_line = strtok(lines[i], str_management[COLON]);
        if (strcmp(user_line, user) == 0) {
            free_list(lines);
            return true;
        }
    }
    free_list(lines);
    return false;
}

static char *change_path_users(char *path)
{
    char *complete = NULL;
    char *user = NULL;

    path++;
    user = my_strdup_delim(path, *str_management[SLASH]);
    if (user == NULL)
        return NULL;
    if (is_user(user) == false) {
        dprintf(STDERR_FILENO, str_message[UKN_USER], user);
        return NULL;
    }
    path += strlen(user);
    complete = my_strcat_inf(3, (char *)str_env[HOME_PATH], user, path);
    free(user);
    return complete;
}

static char *change_path_main_user(char *path, linked_list_t *env)
{
    char *home = NULL;
    char *complete = NULL;

    home = get_env_var(env, str_env[HOME_VAR]);
    if (home == NULL) {
        dprintf(STDERR_FILENO, str_message[NO_FILE_DIR], "");
        return NULL;
    }
    path++;
    complete = my_strcat_inf(2, home, path);
    free(home);
    return complete;
}

static int new_path(char **path, void *env)
{
    char *new = NULL;

    if ((*path)[1] == '\0' || (*path)[1] == *str_management[SLASH])
        new = change_path_main_user(*path, env);
    else
        new = change_path_users(*path);
    if (new == NULL)
        return COMMAND_ERROR;
    free(*path);
    *path = new;
    return EPI_SUCCESS;
}

int replace_wave(char **arg, linked_list_t *env)
{
    int i = 0;
    int return_value = 0;

    while (arg[i] != NULL && env != NULL) {
        if (arg[i][0] == *str_management[WAVE])
            return_value = new_path(&arg[i], env);
        if (return_value != 0)
            break;
        i++;
    }
    return return_value;
}
