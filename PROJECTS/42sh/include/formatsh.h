/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell2-ariel.amriou
** File description:
** formatsh.h
*/

#ifndef FORMATSH_H_
    #define FORMATSH_H_

    #define __maybe_unused  __attribute__((unused))

    #define ALIAS_LEN 6
    #define ALIAS_STR "alias "
    #define BASIC_OPERATOR 1
    #define EDGE_OPERATOR 2
    #define SUCCESS 0
    #define ERROR 84
    #define DELIMS ";<>|&()"
    #define OFFSET 3
    #define STR_CLEAR "\033[1;1H\e[2J"

static const char *super_list[] __maybe_unused = {
    "&&",
    ">>",
    "<<",
    "<",
    ">",
    ";",
    "||",
    "|",
};

static const char *start_new_cmd[] __maybe_unused = {
    "|",
    ";",
    "&&",
    "||",
};

typedef enum {
    COLON,
    SLASH,
    EQUAL,
    DOUBLE_QUOTE,
    SIMPLE_QUOTE,
    WAVE,
    DASH,
    OPEN_PARE,
    CLOSE_PARE,
    OPEN_BRACKET,
    DOLLAR,
    QUESTION,
    STAR,
} management_t;

static const char *str_management[] __maybe_unused = {
    [COLON] = ":",
    [SLASH] = "/",
    [EQUAL] = "=",
    [DOUBLE_QUOTE] = "\"",
    [SIMPLE_QUOTE] = "\'",
    [WAVE] = "~",
    [DASH] = "-",
    [OPEN_PARE] = "(",
    [CLOSE_PARE] = ")",
    [OPEN_BRACKET] = "[",
    [DOLLAR] = "$",
    [QUESTION] = "?",
    [STAR] = "*",
};

typedef enum {
    EXIT,
    UKN_USER,
    NOT_DIR,
    PERM_DENIED,
    CD_TOO_MANY,
    NO_FILE_DIR,
    SETENV_LETTER,
    SETENV_ALNUM,
    SETENV_TOO_MANY,
    UNSETENV_TOO_FEW,
    EXT_SYN,
    COM_NOT_FOUND,
    FORM_ERROR,
    FLOAT_EXP,
    CORE_DUMP,
    AMBI_IN,
    AMBI_OUT,
    MISS_NAME,
    NULL_COM,
    UNALIAS,
    BAD_NUMBER,
    HISTORY_TOO_MANY,
    WHICH_TOO_FEW,
    WHICH_BUILT_IN,
    WHERE_TOO_FEW,
    WHERE_IS_PATH,
    WHERE_BUILT_IN,
    REPEAT_BAD_NB,
    REPEAT_TOO_FEW,
    FOREACH_TOO_FEW,
    FOREACH_NOT_PAR,
    FOREACH_NO_END,
    FOREACH_PROMPT,
    NO_MATCH_STAR,
    END,
    SET_LETTER,
    SET_ALNUM,
    UNSET_TOO_FEW,
    UND_VAR,
    TOO_MANY_CLOSE_PARE,
    TOO_MANY_OPEN_PARE,
    IF_TOO_FEW,
    IF_SYNTAX,
    IF_EMPTY,
    IF_IMPROPER,
    IF_PROMPT,
    ENDIF,
    THEN,
    THEN_NO_END,
    API_ERR,
    API_PATH,
    NO_API_SETUP,
    MOD_ERR,
    MOD_P,
    KEY_P,
    BAD_KEY,
    PROMPT_P,
} message_t;

static const char *str_message[] __maybe_unused = {
    [EXIT] = "exit\n",
    [UKN_USER] = "Unknown user: %s.\n",
    [NOT_DIR] = "%s: Not a directory.\n",
    [PERM_DENIED] = "%s: Permission denied.\n",
    [CD_TOO_MANY] = "cd: Too many arguments.\n",
    [NO_FILE_DIR] = "%s: No such file or directory.\n",
    [SETENV_LETTER] = "setenv: Variable name must begin with a letter.\n",
    [SETENV_ALNUM] = "setenv: Variable name must "
    "contain alphanumeric characters.\n",
    [SETENV_TOO_MANY] = "setenv: Too many arguments.\n",
    [UNSETENV_TOO_FEW] = "unsetenv: Too few arguments.\n",
    [EXT_SYN] = "exit: Expression Syntax.\n",
    [COM_NOT_FOUND] = "%s: Command not found.\n",
    [FORM_ERROR] = "%s: Exec format error. "
    "Binary file not executable.\n",
    [FLOAT_EXP] = "Floating exception",
    [CORE_DUMP] = " (core dumped)",
    [AMBI_IN] = "Ambiguous input redirect.\n",
    [AMBI_OUT] = "Ambiguous output redirect.\n",
    [MISS_NAME] = "Missing name for redirect.",
    [NULL_COM] = "Invalid null command.",
    [UNALIAS] = "unalias: Too few arguments.\n",
    [BAD_NUMBER] = "history: Badly formed number.\n",
    [HISTORY_TOO_MANY] = "history: Too many arguments.\n",
    [WHICH_TOO_FEW] = "which: Too few arguments.\n",
    [WHICH_BUILT_IN] = "%s: shell built-in command.\n",
    [WHERE_TOO_FEW] = "where: Too few arguments.\n",
    [WHERE_IS_PATH] = "where: / in command makes no sense\n",
    [WHERE_BUILT_IN] = "%s is a shell built-in\n",
    [REPEAT_BAD_NB] = "repeat: Badly formed number.\n",
    [REPEAT_TOO_FEW] = "repeat: Too few arguments.\n",
    [FOREACH_TOO_FEW] = "foreach: Too few arguments.\n",
    [FOREACH_NOT_PAR] = "foreach: Words not parenthesized.\n",
    [FOREACH_NO_END] = "foreach: end not found.\n",
    [FOREACH_PROMPT] = "foreach? ",
    [NO_MATCH_STAR] = "%s: No match.\n",
    [END] = "end\n",
    [SET_LETTER] = "set: Variable name must begin with a letter.\n",
    [SET_ALNUM] = "set: Variable name must "
    "contain alphanumeric characters.\n",
    [UNSET_TOO_FEW] = "unset: Too few arguments.\n",
    [UND_VAR] = "%s: Undefined variable.\n",
    [TOO_MANY_CLOSE_PARE] = "Too many )'s.\n",
    [TOO_MANY_OPEN_PARE] = "Too many ('s.\n",
    [IF_TOO_FEW] = "if: Too few arguments.\n",
    [IF_SYNTAX] = "if: Expression Syntax.\n",
    [IF_EMPTY] = "if: Empty if.\n",
    [IF_IMPROPER] = "if: Improper then.\n",
    [IF_PROMPT] = "if? ",
    [ENDIF] = "endif\n",
    [THEN] = "then",
    [THEN_NO_END] = "then: then/endif not found.\n",
    [API_ERR] = "Error while sending request to OpenIA's API. "
    "Check your connexion or the status of OpenIA's API\n",
    [API_PATH] = "/home/%s/.config/42ia.conf",
    [NO_API_SETUP] = "Error: No config file. "
    "Please execute the command \"ai-setup\".\n.",
    [MOD_ERR] = "Incorrect model. Please set a correct model from "
    "https://platform.openai.com/docs/models and try again.\n",
    [MOD_P] = "Please enter OpenIA model (Enter for default gpt-4.1) > ",
    [KEY_P] = "Please your OpenIA api key > ",
    [BAD_KEY] = "You need a correct OpenIA api Key. Try again.\n",
    [PROMPT_P] = "Please enter your pre-prompt as single line "
    "(Enter for default coding pre prompt) > ",
};

typedef enum {
    HOME_PATH,
    HISTORY_PATH,
    CONTENT_BASE_PATH,
    HOSTNAME,
    PASSWD,
    MYSHRC,
    EX_MYSHRC,
    USER_VAR,
    HOME_VAR,
    PATH_VAR,
    OLDPWD_VAR,
    PWD_VAR,
} str_env_t;

static const char *str_env[] __maybe_unused = {
    [HOME_PATH] = "/home/",
    [HISTORY_PATH] = "/.mysh_history",
    [CONTENT_BASE_PATH] = "/bin:/usr/bin",
    [HOSTNAME] = "/etc/hostname",
    [PASSWD] = "/etc/passwd",
    [MYSHRC] = "/.myshrc",
    [EX_MYSHRC] = "example_file/.myshrc",
    [USER_VAR] = "USER",
    [HOME_VAR] = "HOME",
    [PATH_VAR] = "PATH",
    [OLDPWD_VAR] = "OLDPWD",
    [PWD_VAR] = "PWD",
};

typedef enum {
    DEL_LINE,
    M_CURSOR_UP,
    BLUE,
    CYAN,
    YELLOW,
    RED,
    GREEN,
    MAGENTA,
    RESET,
    CLEAR,
} term_caps_t;

static const char *str_term_caps[] __maybe_unused = {
    [DEL_LINE] = "\33[2K\r",
    [M_CURSOR_UP] = "\33[A\r",
    [BLUE] = "\033[1;34m",
    [CYAN] = "\033[1;36m",
    [YELLOW] = "\033[1;93m",
    [RED] = "\033[1;31m",
    [GREEN] = "\033[1;32m",
    [MAGENTA] = "\033[1;35m",
    [RESET] = "\033[0m",
    [CLEAR] = STR_CLEAR,
};

typedef enum {
    CMP_EQUAL,
    CMP_NOT_EQUAL,
    CMP_GREATER,
    CMP_GREATER_EQUAL,
    CMP_LESS,
    CMP_LESS_EQUAL,
    NB_CMP,
} str_cmp_t;

static const char *str_cmp[] __maybe_unused = {
    [CMP_EQUAL] = "==",
    [CMP_NOT_EQUAL] = "!=",
    [CMP_GREATER] = ">",
    [CMP_GREATER_EQUAL] = ">=",
    [CMP_LESS] = "<",
    [CMP_LESS_EQUAL] = "<=",
};

#endif
