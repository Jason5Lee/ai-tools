use crate::{log_error, AppState};
use std::path::PathBuf;
use std::sync::Arc;
use tracing::instrument;

#[derive(Default, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub openai_api_key: Option<String>,
}

#[instrument]
pub fn load_config_from_dir(mut dir: PathBuf) -> Result<Config, ()> {
    dir.push("config.json");
    let config_path = dir;

    match std::fs::File::open(&config_path) {
        Ok(file) => serde_json::from_reader(file).map_err(log_error),
        Err(err) => {
            if err.kind() == std::io::ErrorKind::NotFound {
                Ok(Config::default())
            } else {
                log_error(err);
                Err(())
            }
        }
    }
}

#[instrument(skip(state, config))]
pub fn save_config_to_dir(
    state: &AppState,
    mut dir: PathBuf,
    config: Config,
) -> Result<Arc<Config>, ()> {
    std::fs::create_dir(&dir).ok();
    dir.push("config.json");
    let config_path = dir;

    let file = std::fs::File::create(&config_path).map_err(log_error)?;
    serde_json::to_writer(file, &config).map_err(log_error)?;

    let config = Arc::new(config);
    state.set_config(config.clone());
    Ok(config)
}
