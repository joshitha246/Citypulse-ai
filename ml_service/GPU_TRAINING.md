# CityPulse AI: Priority Prediction GPU Training Guide

This guide explains how to train the incident priority Multi-Layer Perceptron (MLP) model using Google Colab with GPU acceleration and how to import the trained artifacts into your project.

---

## 1. Why Use a GPU for Training?

- **Parallelized Tensor Operations:** Neural networks are composed of layers that perform large-scale matrix multiplications (e.g., $Y = \sigma(XW + b)$). CPUs process these sequentially or with low parallelism. A GPU (such as the NVIDIA T4 provided in Colab) contains thousands of CUDA cores designed to perform mathematical operations concurrently.
- **Offloading Optimization:** During backpropagation, TensorFlow offloads the gradient computations and weight updates (e.g., Adam optimizer calculations) to the GPU. This significantly reduces execution time per epoch.
- **TensorFlow CUDA Integration:** TensorFlow automatically detects NVIDIA GPUs via CUDA and cuDNN libraries. Our training script prints:
  `gpus = tf.config.list_physical_devices('GPU')`
  If a GPU is present, TensorFlow binds to the device and offloads model execution automatically.

---

## 2. Steps to Train in Google Colab (Recommended)

1. **Open Colab:** Go to [Google Colab](https://colab.research.google.com/).
2. **Upload the Notebook:** Click **File -> Upload notebook** and upload [priority_model_training.ipynb](priority_model_training.ipynb).
3. **Enable GPU Runtime:**
   - In the Colab menu, navigate to **Runtime -> Change runtime type**.
   - Under **Hardware accelerator**, select **GPU** (choose **T4 GPU** if prompted).
   - Click **Save**.
4. **Execute all cells:** Run the notebook cells sequentially (or press `Ctrl + F9` to Run All).
   - The first cell verifies GPU detection by displaying:
     `✅ GPU Acceleration is ENABLED! - Found GPU device: PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')`
   - The training phase will complete within seconds.
   - The final cell will automatically trigger a browser download for the two generated model artifacts:
     1. **`priority_model.keras`** (the trained Keras MLP model containing structural weights and layers)
     2. **`preprocessor.pkl`** (the serialized TF-IDF vectorizer and encoders for categories)
5. **Place in Workspace:** Copy both downloaded files into your local `ml_service/` directory.

---

## 3. Running Training Locally

If you have a local environment with python, scikit-learn, pandas, and tensorflow installed, you can compile and train the model locally by running:

```bash
cd ml_service
python train.py
```

The script will automatically detect if a local CUDA-compatible NVIDIA GPU is configured on your machine, print the device name, and utilize it. Otherwise, it will train gracefully on your CPU.
