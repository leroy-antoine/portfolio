/*
** EPITECH PROJECT, 2024
** test
** File description:
** my_str_to_word_array.c
*/

#include <stdbool.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

static int staylen(char const *buffer, char c)
{
    int i = 0;

    while (buffer[i] != '\0' && buffer[i] != c)
        i++;
    if (buffer[i] == c)
        i++;
    return i;
}

static char *staydup(char const *buffer, char c)
{
    char *str = malloc(staylen(buffer, c) + 1);
    int i = 0;

    if (str == NULL)
        return NULL;
    while (buffer[i] != '\0' && buffer[i] != c) {
        str[i] = buffer[i];
        i++;
    }
    str[i] = '\0';
    return str;
}

static int is_delim(char const c, char const *delim)
{
    for (int i = 0; delim[i] != '\0'; i++)
        if (c == delim[i])
            return true;
    return false;
}

static int check_quote(char const *buffer, char const *stay)
{
    int i = 0;
    char const c = buffer[0];

    if (is_delim(*buffer, stay) == false)
        return 0;
    ++i;
    while (buffer[i] != c) {
        if (buffer[i] == '\0') {
            dprintf(STDERR_FILENO, "Unmatched \'%c\'.\n", c);
            return -1;
        }
        ++i;
    }
    return 0;
}

static int wordlen(char const *buffer, char const *delim)
{
    int i = 0;

    while (buffer[i] != '\0' && is_delim(buffer[i], delim) == false)
        i++;
    return i;
}

static char *worddup(char const *buffer, char const *delim)
{
    char *word = malloc(wordlen(buffer, delim) + 1);
    int i = 0;

    if (word == NULL)
        return NULL;
    while (buffer[i] != '\0' && is_delim(buffer[i], delim) == false) {
        word[i] = buffer[i];
        i++;
    }
    word[i] = '\0';
    return word;
}

static int count_words(char const *buffer, char const *delim, char const *stay)
{
    int counter = 0;

    if (buffer == NULL || delim == NULL)
        return 0;
    while (*buffer != '\0') {
        if (is_delim(*buffer, delim) == true) {
            buffer++;
            continue;
        }
        if (check_quote(buffer, stay) == -1)
            return -1;
        if (is_delim(*buffer, stay) == true) {
            buffer += staylen(&(buffer[1]), *buffer) + 1;
            counter++;
            continue;
        }
        buffer += wordlen(buffer, delim);
        counter++;
    }
    return counter;
}

static void populate_list(char const *buffer, char const *delim,
    char const *stay, char **list)
{
    int counter = 0;

    while (*buffer != '\0') {
        if (is_delim(*buffer, delim) == true) {
            buffer++;
            continue;
        }
        if (is_delim(*buffer, stay) == true) {
            list[counter] = staydup(&(buffer[1]), *buffer);
            buffer += staylen(&(buffer[1]), *buffer) + 1;
            counter++;
            continue;
        }
        list[counter] = worddup(buffer, delim);
        buffer += wordlen(buffer, delim);
        counter++;
    }
    list[counter] = NULL;
}

char **my_str_to_word_array(char const *buffer,
    char const *delim, char const *stay)
{
    int len = count_words(buffer, delim, stay);
    char **list = NULL;

    if (len < 0)
        return NULL;
    if (buffer == NULL || delim == NULL)
        return NULL;
    list = malloc((len + 1) * sizeof(char *));
    if (list == NULL)
        return NULL;
    populate_list(buffer, delim, stay, list);
    return list;
}
