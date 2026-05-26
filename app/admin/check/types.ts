export interface TeamAdminData {
  id: string;
  team_name: string;
  jenis_lomba: string;
  // Status Berkas Data Comp
  has_ipynb: boolean;
  has_laporan: boolean;
  has_ppt: boolean;
  // Status Berkas UI/UX
  has_mockup?: boolean;
  has_video?: boolean;
  has_prototype?: boolean;
  // Nilai Panitia
  score_ipynb?: number;
  score_laporan?: number;
  score_ppt?: number;
  final_score?: number; // Digunakan untuk total poin akhir UI/UX
}

export interface GlobalConfig {
  isDeadlineClosed: boolean;
  isOpen: boolean;
}