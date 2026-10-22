/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** exec_esc.c
*/

#include <stdbool.h>
#include <unistd.h>
#include <termios.h>
#include <glob.h>
#include <string.h>
#include "mysh.h"
#include "my.h"

static int is_slash(char const *str)
{
    for (int i = 0; str[i] != '\0'; ++i) {
        if (str[i] == '/')
            return 1;
    }
    return 0;
}

static char *get_total(char *dup, int index, int *len)
{
    char *final = NULL;
    int total_len = 0;

    if (dup == NULL)
        return NULL;
    dup[index] = '\0';
    *len = strlen(dup);
    for (int i = *len - 1; i >= 0 && dup[i] != ' ' && dup[i] != '\t'; --i)
        ++total_len;
    final = calloc(total_len + 1, sizeof(char));
    if (final == NULL)
        return NULL;
    for (int i = *len - 1; total_len > 0; --i) {
        final[total_len - 1] = dup[i];
        --total_len;
    }
    return final;
}

static char *get_path(char *buffer, int index)
{
    int len = 0;
    char *dup = strdup(buffer);
    char *final = get_total(dup, index, &len);

    free(dup);
    if (is_slash(final) == 0)
        return strdup("");
    len = strlen(final);
    for (int i = len; i > 0; --i)
        if (final[i - 1] == '/') {
            final[i] = '\0';
            return final;
        }
    return final;
}

static char *glob_tab(char *dup, int index)
{
    char *final = NULL;
    int len = 0;
    int total_len = 0;

    if (dup == NULL)
        return NULL;
    dup[index] = '\0';
    len = strlen(dup);
    for (int i = len - 1; i >= 0 && dup[i] != ' ' && dup[i] != '\t'; --i)
        ++total_len;
    final = calloc(total_len + 2, sizeof(char));
    if (final == NULL)
        return NULL;
    final[total_len] = '*';
    for (int i = len - 1; total_len > 0; --i) {
        final[total_len - 1] = dup[i];
        --total_len;
    }
    free(dup);
    return final;
}

static char **get_files(char *buffer, int index)
{
    char *path = glob_tab(strdup(buffer), index);
    glob_t globing = {0};
    char **values = NULL;

    if (path == NULL)
        return NULL;
    glob(path, GLOB_ERR | GLOB_MARK, NULL, &globing);
    free(path);
    values = dup_list(globing.gl_pathv);
    globfree(&globing);
    return values;
}

static void update_current(char **current, char *file)
{
    for (int i = 0; (*current)[i] != '\0'; ++i)
        if ((*current)[i] != file[i])
            (*current)[i] = '\0';
}

static int len_current(char *buff)
{
    int len = strlen(buff);
    int len_current = 0;

    for (int i = len - 1; i >= 0; --i) {
        if (buff[i] == ' ' || buff[i] == '\t' || buff[i] == '/')
            break;
        ++len_current;
    }
    return len_current;
}

static void autocomplete(index_t *ind, char **files)
{
    char *current = files[0];
    char *buff = strdup(ind->buf);

    if (buff == NULL)
        return;
    for (int i = 1; files[i] != NULL; ++i)
        update_current(&current, files[i]);
    if (current[0] != '\0')
        buff[strlen(buff) - len_current(buff)] = '\0';
    ind->buf = my_strcat_inf(2, buff, current);
    if (ind->buf == NULL) {
        ind->buf = buff;
        free_list(files);
        return;
    }
    free(buff);
    free_list(files);
    ind->len = strlen(ind->buf);
    ind->index = ind->len;
}

static void print_tab(char **files, int len)
{
    dprintf(STDOUT_FILENO, "\n");
    for (int i = 0; i < len; ++i)
        dprintf(STDOUT_FILENO, "%s\t", files[i]);
    dprintf(STDOUT_FILENO, "\n\n");
}

void do_tab(index_t *ind)
{
    char **files = get_files(ind->buf, ind->index);
    char *path = get_path(ind->buf, ind->index);
    int len = array_len(files);

    if (len <= 0 || path == NULL)
        return;
    files = array_dup_offset(files, strlen(path));
    free(path);
    if (files == NULL)
        return;
    if (len > 1)
        print_tab(files, len);
    autocomplete(ind, files);
}
