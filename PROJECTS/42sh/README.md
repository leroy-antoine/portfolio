my_shell

my_shell is a simple TCSH-like shell implementation. This project aims to replicate TCSH shell functionalities such as executing commands, handling input/output, and managing processes.

Features :

    Command execution with basic shell commands.

    Pipes, semicolon and redirections (< << > ; |)

    Basic shell environment with built-in exit handling.

Installation

To get started with my_shell, follow the steps below: Prerequisites

Make sure you have the following installed:

    Git

    Make

    A C compiler (e.g., GCC)

Setup Instructions

Clone the repository:

    git clone git@github.com:leroy-antoine/my_shell.git

Navigate to the project directory:

    cd my_shell

Build the project:

/!\ Firstly, run:

    make install

To build the shell, simply run:

    make

If you want to force rebuild the project (in case of changes), you can use:

    make re

Run my_shell:

After the build process is complete, run the shell with:

    ./42sh

To exit the shell: You can exit the shell by typing:

    exit

    Alternatively, you can press CTRL + D.

Cleanup

After using the shell, don't forget to clean up your build files. You can do this by running:

    make clean

Or to remove all generated files (including the executable):

    make fclean

Contributing

Feel free to open issues, submit pull requests, or improve the documentation! All contributions are welcome.
