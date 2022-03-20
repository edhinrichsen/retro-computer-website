



## *My Own Programming Language*
## 2021

### • Lexing & Tokenization, Syntactic Analysis,
### • Parsing, Compiler & Interpreter Design

For a while now I have been fascinated by computer languages and when over the semester break, I had a bit of time on my hands, I decided to—as an academic exercise—design my own language. My language consists of two components; the recursive descent parser which first lexers and tokenizes the input before generating an abstract syntax tree (AST); and the interpreter which traverses the AST and produces the appropriate output.

My language currently includes features such as closures, lambda expressions, first class and pure functions, making it well-suited to functional programming. In addition to this I plan to add support for multithreading and a stronger type system plus optimizations for tail-call recursion. I am also experimenting with implementing a stack based virtual machine—bytecode interpreter—to run my language.