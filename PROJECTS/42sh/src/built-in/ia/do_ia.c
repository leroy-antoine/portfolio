/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** di_ia.c
*/

#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <json-c/json.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"
#include "aish.h"

static char *get_prompt(char *user_prompt, ai_t *ia)
{
    char *prompt = calloc(PROMPT_MAX_SIZE, sizeof(char));

    if (prompt == NULL)
        return NULL;
    for (size_t i = 0; user_prompt[i] != '\0'; ++i)
        if (user_prompt[i] == '\n' || user_prompt[i] == '?'
            || user_prompt[i] == '!' || user_prompt[i] == '\"'
            || user_prompt[i] == '\'' || user_prompt[i] == '&')
            user_prompt[i] = ' ';
    snprintf(prompt, PROMPT_MAX_SIZE, ia->prompt, user_prompt);
    for (size_t i = 0; prompt[i] != '\0'; ++i)
        if (prompt[i] == '\n')
            prompt[i] = ' ';
    return prompt;
}

static char *get_curl(char *user_prompt, ai_t *ia)
{
    char *req = calloc(PROMPT_MAX_SIZE, sizeof(char));
    char *prompt = NULL;

    if (req == NULL)
        return NULL;
    prompt = get_prompt(user_prompt, ia);
    if (prompt == NULL)
        return NULL;
    snprintf(req, PROMPT_MAX_SIZE, "curl https://api.openai.com/v1/responses "
        "-H \"Content-Type: application/json\" -H \"Authorization: Bearer %s\""
        " -d \'{\"model\": \"%s\", \"input\": \"%s\"}\' -s",
        ia->api_key, ia->model, prompt);
    free(prompt);
    return req;
}

static char *get_json(char *user_prompt, ai_t *ia)
{
    char *req = get_curl(user_prompt, ia);
    char *response = NULL;
    FILE *request = NULL;

    if (req == NULL)
        return NULL;
    response = calloc(RESPONSE_MAX_SIZE, sizeof(char));
    if (response == NULL)
        return NULL;
    request = popen(req, "r");
    free(req);
    if (request == NULL)
        return NULL;
    fread(response, RESPONSE_MAX_SIZE, 1, request);
    pclose(request);
    if (response[0] == '\0') {
        dprintf(2, "%s", str_message[API_ERR]);
        return NULL;
    }
    return response;
}

static void *error_json(struct json_object *json)
{
    struct json_object *error = NULL;
    struct json_object *message = NULL;

    if (json_object_object_get_ex(json, "error", &error) == false)
        return NULL;
    if (json_object_object_get_ex(error, "message", &message) == false)
        return NULL;
    dprintf(2, "%s See ~/.config/42ia.conf or execute \"ai-setup\".\n",
        json_object_get_string(message));
    return NULL;
}

static char const *get_ia(char *user_prompt, ai_t *ia)
{
    char *response = get_json(user_prompt, ia);
    struct json_object *json = NULL;
    struct json_object *output = NULL;
    struct json_object *content = NULL;
    struct json_object *content2 = NULL;
    struct json_object *index = NULL;
    struct json_object *text = NULL;

    if (response == NULL)
        return NULL;
    json = json_tokener_parse(response);
    free(response);
    if (json_object_object_get_ex(json, "output", &output) == false)
        return error_json(json);
    content = json_object_array_get_idx(output, 0);
    if (json_object_object_get_ex(content, "content", &content2) == false)
        return NULL;
    index = json_object_array_get_idx(content2, 0);
    json_object_object_get_ex(index, "text", &text);
    return text == NULL ? "" : json_object_get_string(text);
}

static char *get_line(char *infos, char const *delim)
{
    char *tmp = strtok(infos, delim);

    if (tmp == NULL)
        return NULL;
    return strdup(tmp);
}

static int get_ai_infos(ai_t *ia, char const *user)
{
    char path[PATH_MAX_LEN] = {0};
    char *infos = NULL;

    snprintf(path, PATH_MAX_LEN, str_message[API_PATH], user);
    infos = open_file(path);
    if (infos == NULL)
        return ERROR;
    ia->model = get_line(infos, "\n");
    if (ia->model == NULL)
        return ERROR;
    ia->api_key = get_line(NULL, "\n");
    if (ia->api_key == NULL)
        return ERROR;
    ia->prompt = get_line(NULL, "");
    if (ia->prompt == NULL)
        return ERROR;
    free(infos);
    return SUCCESS;
}

static bool exec_ask(void)
{
    char *line = NULL;
    size_t size = 0;

    dprintf(1, "Do you want to execute ? (y / n) ");
    while (getline(&line, &size, stdin) != EOF) {
        if (strcmp(line, "n\n") == 0) {
            free(line);
            dprintf(1, "Aborting...\n");
            return false;
        }
        if (strcmp(line, "y\n") == 0) {
            free(line);
            return true;
        }
        dprintf(1, "Do you want to execute ? (y / n) ");
    }
    dprintf(1, "\nAborting...\n");
    return false;
}

static int ask(bool debug, char const *response)
{
    if (debug == true) {
        dprintf(1, "%s\n", response);
        if (!exec_ask())
            return SUCCESS;
    }
    return system(response);
}

int do_ia(system_t *sys, char *input)
{
    ai_t ia = {0};
    char const *response = NULL;
    bool debug = false;

    if (input[0] == '%') {
        ++input;
        debug = true;
    }
    if (get_ai_infos(&ia, sys->user) == ERROR) {
        dprintf(2, "%s", str_message[NO_API_SETUP]);
        return COMMAND_ERROR;
    }
    response = get_ia(input, &ia);
    free(ia.api_key);
    free(ia.prompt);
    free(ia.model);
    if (response == NULL)
        return COMMAND_ERROR;
    return ask(debug, response);
}
