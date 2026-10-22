/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_ia_setup.c
*/

#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <json-c/json.h>
#include <fcntl.h>
#include "my.h"
#include "mysh.h"
#include "aish.h"
#include "formatsh.h"

static int check_model(char *model)
{
    for (size_t i = 0; i < NB_MODELS; i++) {
        if (strncmp(model, models[i], strlen(models[i])) == 0)
            return SUCCESS;
    }
    dprintf(2, "%s", str_message[MOD_ERR]);
    return ERROR;
}

static int ask_model(int fd)
{
    char *model = NULL;
    size_t size = 0;

    dprintf(1, "%s", str_message[MOD_P]);
    if (getline(&model, &size, stdin) == EOF)
        return ERROR;
    if (model[0] == '\n') {
        free(model);
        model = strdup(defalut_model);
        if (model == NULL)
            return ERROR;
    }
    if (check_model(model) == ERROR)
        return ask_model(fd);
    dprintf(fd, "%s", model);
    free(model);
    return SUCCESS;
}

static int ask_key(int fd)
{
    char *key = NULL;
    size_t size = 0;

    dprintf(1, "%s", str_message[KEY_P]);
    if (getline(&key, &size, stdin) == EOF)
        return ERROR;
    if (key[0] == '\n' || strncmp(key, PRE_API, strlen(PRE_API)) != 0) {
        dprintf(2, "%s", str_message[BAD_KEY]);
        return ask_key(fd);
    }
    dprintf(fd, "%s", key);
    free(key);
    return SUCCESS;
}

static int ask_prompt(int fd)
{
    char *prompt = NULL;
    size_t size = 0;

    dprintf(1, "%s", str_message[PROMPT_P]);
    if (getline(&prompt, &size, stdin) == EOF)
        return ERROR;
    if (prompt[0] == '\n') {
        free(prompt);
        prompt = strdup(defalut_preprompt);
        if (prompt == NULL)
            return ERROR;
    }
    dprintf(fd, "%s", prompt);
    free(prompt);
    return SUCCESS;
}

int do_ia_setup(char __maybe_unused **args, system_t *sys)
{
    char path[PATH_MAX_LEN] = {0};
    int fd = 0;

    snprintf(path, PATH_MAX_LEN, str_message[API_PATH], sys->user);
    fd = open(path, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd == -1)
        return COMMAND_ERROR;
    if (ask_model(fd) == ERROR)
        return COMMAND_ERROR;
    if (ask_key(fd) == ERROR)
        return COMMAND_ERROR;
    if (ask_prompt(fd) == ERROR)
        return COMMAND_ERROR;
    return SUCCESS;
}
