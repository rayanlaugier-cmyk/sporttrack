# SportTrack V10 - installation cloud

## 1. Créer la table sécurisée

1. Ouvre ton projet Supabase.
2. Dans le menu gauche, clique sur **SQL Editor**.
3. Clique sur **New query**.
4. Ouvre le fichier `supabase-setup.sql`, copie tout son contenu et colle-le.
5. Clique sur **Run**.

## 2. Simplifier la création du compte personnel

Dans Supabase :

1. Va dans **Authentication > Providers > Email**.
2. Pour une application strictement personnelle, tu peux désactiver **Confirm email**.
3. Enregistre.

Si tu gardes la confirmation d’email, configure aussi l’URL de ton site GitHub Pages dans **Authentication > URL Configuration > Site URL**.

## 3. Mettre le site sur GitHub

Remplace ton ancien `index.html` par le nouveau, puis fais **Commit changes**.

## 4. Première connexion et transfert des données

Sur l’appareil qui possède actuellement toutes tes données :

1. Ouvre la nouvelle V10.
2. Crée ton compte ou connecte-toi.
3. Les données locales sont envoyées automatiquement dans Supabase.
4. Attends que l’indicateur affiche **Sauvegardé**.

Sur l’autre appareil :

1. Ouvre la V10.
2. Connecte-toi avec le même email et le même mot de passe.
3. Les données du cloud seront chargées automatiquement.

## Fonctionnement

- Chaque modification est sauvegardée automatiquement après environ 1 seconde.
- Le site vérifie les mises à jour cloud toutes les 15 secondes et quand tu reviens sur l’onglet.
- Les boutons Exporter/Importer restent disponibles comme sauvegarde supplémentaire.
- La Publishable Key peut être présente dans le navigateur. Ne mets jamais une Secret Key ou une Service Role Key dans le site.
