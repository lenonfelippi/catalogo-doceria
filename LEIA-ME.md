# Catálogo Digital com Pedido via WhatsApp

Site simples (HTML, CSS e JavaScript, sem banco de dados) para um pequeno comércio
mostrar seus produtos e receber pedidos prontos pelo WhatsApp.

## Como personalizar

1. Abra `dados.js` no Bloco de Notas ou no VS Code.
2. Troque o nome, o slogan, o endereço, o horário e o número do WhatsApp em `LOJA`.
3. Edite a lista `PRODUTOS`: nome, categoria, preço, emoji e descrição.
4. (Opcional) Para usar fotos, crie a pasta `img`, coloque as imagens nela e preencha
   `imagem: "img/nome-da-foto.jpg"`.

## Como publicar de graça (GitHub Pages)

1. Crie uma conta em github.com e um repositório novo e público (ex.: `catalogo-doceria`).
2. Clique em **Add file > Upload files** e envie os arquivos da pasta `catalogo`.
3. Vá em **Settings > Pages**, escolha a branch `main` e a pasta `/ (root)`, e salve.
4. Em 1 ou 2 minutos o site fica no ar em `https://SEU-USUARIO.github.io/catalogo-doceria/`.

## Funcionalidades

- Lista de produtos com busca por nome e filtro por categoria
- Carrinho com controle de quantidade, salvo no navegador
- Escolha entre retirada e entrega (com taxa)
- Forma de pagamento e observações
- Botão que abre o WhatsApp da loja com o pedido já escrito e o total calculado
- Layout adaptado para celular
