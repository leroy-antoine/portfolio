/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** my_getline.c
*/

#include <stdbool.h>
#include <time.h>
#include <unistd.h>
#include <stdio.h>
#include <termios.h>
#include <string.h>
#include <stdlib.h>
#include <sys/ioctl.h>
#include <signal.h>
#include <stdio.h>
#include <math.h>
#include "mysh.h"
#include "formatsh.h"

static void add_char(index_t *ind, char const c)
{
    for (size_t i = 0; i < ARRAY_SIZE(special_char_list); ++i)
        if (special_char_list[i].is_special_char(c) == true)
            return special_char_list[i].exec_special_char(ind);
    exec_add_letter(ind, c);
    return;
}

static int init_termios(struct termios *curterm)
{
    if (tcgetattr(STDIN_FILENO, curterm) != SUCCESS)
        return EPI_ERROR;
    curterm->c_lflag &= ~(ICANON | ECHO);
    curterm->c_cc[VTIME] = 0;
    curterm->c_cc[VMIN] = 1;
    if (tcsetattr(STDIN_FILENO, TCSANOW, curterm) != SUCCESS)
        return EPI_ERROR;
    return EPI_SUCCESS;
}

static int return_vars(index_t *ind, char **buff, size_t *len)
{
    if (ind->buf != NULL) {
        *buff = strdup(ind->buf);
        if (*buff == NULL)
            return EPI_ERROR;
        *len = strlen(ind->buf);
    } else {
        len = 0;
        *buff = strdup("\n");
        if (*buff == NULL)
            return EPI_ERROR;
    }
    if (tcsetattr(STDIN_FILENO, TCSANOW, &ind->old) != SUCCESS)
        return EOT;
    if (ind->exit == EOT)
        return EOT;
    return SUCCESS;
}

static int my_return_value(index_t *ind, int value)
{
    if (ind != NULL) {
        free(ind->buf);
        free(ind);
    }
    return value;
}

int my_getline(char *prompt, char **buff, size_t *len, history_t *history)
{
    char c = 0;
    struct termios curterm = {0};
    index_t *ind = init_getline(history);
    int return_value = 0;

    if (ind == NULL || init_termios(&curterm) == EPI_ERROR)
        return EPI_ERROR;
    signal(SIGINT, SIG_IGN);
    signal(SIGTSTP, SIG_IGN);
    while (read(STDIN_FILENO, &c, sizeof(char)) != EOF) {
        if (ind->esc && c == *str_management[OPEN_BRACKET])
            get_arrow(c, ind);
        else
            add_char(ind, c);
        if (ind->exit == true || ind->exit == EOT)
            break;
        prompt_handling(ind, prompt);
    }
    return_value = return_vars(ind, buff, len);
    return my_return_value(ind, return_value);
}
