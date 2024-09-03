import { fetchComposerTable } from "@/app/lib/data";
import Link from "next/link";

export default async function ComposersTable() {
  const composerData = await fetchComposerTable();

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Birth Year</th>
            <th>Birth Place</th>
            <th>Death Year</th>
            <th>Death Place</th>
          </tr>
        </thead>
        <tbody>
          {composerData.map((composer) => {
            return (
              <tr key={composer.id}>
                <td>
                  <Link href={`/database/composer/${composer.id}`}>
                    {composer.name}
                  </Link>
                </td>
                <td>{composer.birthDate.getFullYear()}</td>
                <td>{composer.birthplace.name}</td>
                <td>{composer.deathDate.getFullYear()}</td>
                <td>{composer.deathplace.name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
