import { fetchComposerById } from "./lib/data";

export default async function Home() {
  const composer = await fetchComposerById(
    "http://www.wikidata.org/entity/Q436512"
  );

  console.log(composer);

  return (
    <main>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Birth Year</th>
            <th>Birth Place</th>
            <th>Death Year</th>
            <th>Death Place</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{composer.id}</td>
            <td>{composer.name}</td>
            <td>{composer.birthDate.getFullYear()}</td>
            <td>{composer.birthplace.name}</td>
            <td>{composer.deathDate.getFullYear()}</td>
            <td>{composer.deathplace.name}</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
