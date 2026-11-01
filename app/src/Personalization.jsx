import React from "react";
import { useAccount } from "./AccountContext";
import { profileState } from "./recommendations";

export function InlinePersonalization() {
  const { account } = useAccount();
  if (!account)
    return (
      <p className="inline-personalization">
        Ingin rekomendasi yang lebih sesuai kebutuhanmu?{" "}
        <a href="/daftar?next=%2Fprofil%2Fedit&intent=personalisasi">
          Buat akun dan lengkapi profilmu.
        </a>
      </p>
    );
  if (profileState(account.profile) !== "Cukup untuk rekomendasi awal")
    return (
      <p className="inline-personalization">
        Ingin rekomendasi yang lebih sesuai kebutuhanmu?{" "}
        <a href="/profil/edit">Lengkapi profilmu.</a>
      </p>
    );
  return (
    <p className="inline-personalization">
      Temukan program berdasarkan profilmu.{" "}
      <a href="/program/rekomendasi">Lihat rekomendasi.</a>
    </p>
  );
}
