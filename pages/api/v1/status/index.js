import database from "infra/database.js";

async function status(request, response) {
  const result = await database.query("SELECT 1 + 1 as sun;");
  console.log(result.rows);
  response
    .status(200)
    .json({ chave: "alunos do curso.dev são acima da média" });
}
export default status;
