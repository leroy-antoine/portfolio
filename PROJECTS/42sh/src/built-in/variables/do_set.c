/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_set
*/

#include "mysh.h"
#include "my.h"
#include "formatsh.h"
#include <unistd.h>
#include <string.h>

static int show_var(linked_list_t *list)
{
    node_t *head = list->head;

    while (head != NULL) {
        dprintf(STDOUT_FILENO, "%s\t%s\n",
            ((var_t *)head->data)->var, ((var_t *)head->data)->value);
        head = head->next;
    }
    return EPI_SUCCESS;
}

static bool is_letter(char c, const char *str)
{
    for (int i = 0; str[i] != '\0'; i++)
        if (c == str[i])
            return true;
    return false;
}

static bool correct_name_var(char *var)
{
    if (var == NULL)
        return false;
    if (is_letter(*var, first_env_char_allowed) == false) {
        dprintf(STDERR_FILENO, "%s", str_message[SET_LETTER]);
        return false;
    }
    for (int i = 0; var[i] != '\0'; i++)
        if (is_letter(var[i], env_char_allowed) == false) {
            dprintf(STDERR_FILENO, "%s", str_message[SET_ALNUM]);
            return false;
        }
    return true;
}

static int add_to_list(linked_list_t *list, char *var, char *value)
{
    var_t *new = NULL;
    node_t *head = list->head;

    if (correct_name_var(var) == false)
        return COMMAND_ERROR;
    new = create_var(var, value);
    if (new == NULL)
        return COMMAND_ERROR;
    while (head != NULL) {
        if (strcmp(((var_t *)head->data)->var, var) == 0) {
            delete_node(list, head, &free_var);
            break;
        }
        head = head->next;
    }
    push_to_tail(list, new);
    sort_linked_list(list, &sort_var);
    return SUCCESS;
}

static int refactor_str(linked_list_t *list, char *str, int ind)
{
    char *tmp = malloc(sizeof(char) * (ind + 1));
    int exit = 0;

    if (tmp == NULL)
        return COMMAND_ERROR;
    strncpy(tmp, str, ind);
    tmp[ind] = '\0';
    exit = add_to_list(list, tmp, str + ind +1);
    free(tmp);
    return exit;
}

static int handle_arg(char **args, linked_list_t *list, int *ind)
{
    int exit = 0;
    int pos = is_in_str(args[*ind], *str_management[EQUAL]);

    if (pos != -1)
        exit = refactor_str(list, args[*ind], pos);
    else if (args[*ind + 1] == NULL
        || strcmp(args[*ind + 1], str_management[EQUAL]) != 0
        || args[*ind + 2] == NULL)
        exit = add_to_list(list, args[*ind], "");
    else {
        exit = add_to_list(list, args[*ind], args[*ind + 2]);
        *ind += 2;
    }
    if (pos == -1 && args[*ind + 1] != NULL
        && strcmp(args[*ind + 1], str_management[EQUAL]) == 0
        && args[*ind + 2] == NULL)
        (*ind)++;
    return exit;
}

int do_set(char **args, system_t *sys)
{
    int list_len = my_list_len(args);

    if (list_len == 1)
        return show_var(sys->var);
    for (int i = 1; args[i] != NULL; i++) {
        if (handle_arg(args, sys->var, &i) != SUCCESS)
            return COMMAND_ERROR;
    }
    return SUCCESS;
}
